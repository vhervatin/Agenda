
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Configure Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Set CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Serve HTTP requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const { webhookId, eventType, payload } = requestData;

    // Validate required fields
    if (!webhookId || !eventType || !payload) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get webhook configuration
    const { data: webhookConfig, error: webhookError } = await supabase
      .from("webhook_configurations")
      .select("*")
      .eq("id", webhookId)
      .single();

    if (webhookError || !webhookConfig) {
      console.error("Webhook not found:", webhookError);
      return new Response(
        JSON.stringify({ error: "Webhook configuration not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if webhook is active
    if (!webhookConfig.is_active) {
      console.log("Webhook is inactive:", webhookId);
      
      // Log the attempt
      await supabase.from("webhook_logs").insert([
        {
          webhook_id: webhookId,
          event_type: eventType,
          payload,
          status: "skipped",
          attempts: 0,
        },
      ]);
      
      return new Response(
        JSON.stringify({ message: "Webhook is inactive", success: false }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create a log entry for this webhook attempt
    const { data: logEntry, error: logError } = await supabase
      .from("webhook_logs")
      .insert([
        {
          webhook_id: webhookId,
          event_type: eventType,
          payload,
          status: "pending",
          attempts: 1,
        },
      ])
      .select()
      .single();

    if (logError) {
      console.error("Failed to create webhook log:", logError);
    }

    // Attempt to send the webhook
    let success = false;
    let errorMessage = "";
    
    try {
      const webhookResponse = await fetch(webhookConfig.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: eventType,
          data: payload,
          timestamp: new Date().toISOString(),
        }),
      });

      success = webhookResponse.ok;
      
      // Update the log with the result
      if (logEntry?.id) {
        await supabase
          .from("webhook_logs")
          .update({
            status: success ? "success" : "failed",
            attempts: 1,
          })
          .eq("id", logEntry.id);
      }
      
      // For failed webhooks, implement retry logic
      if (!success && logEntry?.id) {
        // Schedule retry - in a real system, you might use a queue or function call
        console.log("Webhook delivery failed, scheduling retry...");
        
        // This is a simple implementation that retries immediately
        // In a production system, you would use a more sophisticated retry mechanism
        const MAX_RETRIES = 3;
        let attempts = 1;
        
        while (attempts < MAX_RETRIES) {
          attempts++;
          
          try {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
            
            // Retry the request
            const retryResponse = await fetch(webhookConfig.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                event: eventType,
                data: payload,
                timestamp: new Date().toISOString(),
                retry: attempts,
              }),
            });
            
            success = retryResponse.ok;
            
            // If successful, break the retry loop
            if (success) break;
          } catch (retryError: any) {
            console.error(`Retry ${attempts} failed:`, retryError);
            errorMessage = retryError.message || "Unknown error during retry";
          }
        }
        
        // Update the log with final status
        await supabase
          .from("webhook_logs")
          .update({
            status: success ? "success" : "failed",
            attempts: attempts,
          })
          .eq("id", logEntry.id);
      }
    } catch (error: any) {
      console.error("Error sending webhook:", error);
      errorMessage = error.message || "Unknown error";
      
      // Update the log with the error
      if (logEntry?.id) {
        await supabase
          .from("webhook_logs")
          .update({
            status: "failed",
            attempts: 1,
          })
          .eq("id", logEntry.id);
      }
    }

    return new Response(
      JSON.stringify({
        success,
        message: success ? "Webhook delivered successfully" : `Webhook delivery failed: ${errorMessage}`,
        logId: logEntry?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Process webhook error:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
