
export const createAvailableSlotsBulk = async (
  professionalId: string | "all",
  startDate: Date,
  endDate: Date,
  selectedDays: number[],
  timeRanges: Array<{startHour: string, startMinute: string, endHour: string, endMinute: string}>
): Promise<{count: number}> => {
  try {
    const slots = [];
    let currentDate = new Date(startDate);

    let professionals: { id: string }[] = [];
    if (professionalId === "all") {
      const { data: profsData, error: profsError } = await supabase
        .from('professionals')
        .select('id')
        .eq('active', true);
        
      if (profsError) throw profsError;
      professionals = profsData || [];
    } else {
      professionals = [{ id: professionalId }];
    }
    
    // Ensure we have valid time ranges with all required properties
    const validTimeRanges = timeRanges.filter(range => 
      range.startHour && range.startMinute && range.endHour && range.endMinute
    ) as Array<{startHour: string, startMinute: string, endHour: string, endMinute: string}>;
    
    if (validTimeRanges.length === 0) {
      return { count: 0 };
    }
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      if (selectedDays.includes(dayOfWeek)) {
        for (const range of validTimeRanges) {
          for (const prof of professionals) {
            const slotStartTime = new Date(currentDate);
            slotStartTime.setHours(
              parseInt(range.startHour),
              parseInt(range.startMinute),
              0,
              0
            );
            
            const slotEndTime = new Date(currentDate);
            slotEndTime.setHours(
              parseInt(range.endHour),
              parseInt(range.endMinute),
              0,
              0
            );
            
            slots.push({
              professional_id: prof.id,
              start_time: slotStartTime.toISOString(),
              end_time: slotEndTime.toISOString(),
              is_available: true
            });
          }
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`Creating ${slots.length} slots in bulk`);
    
    if (slots.length === 0) {
      return { count: 0 };
    }
    
    const { data, error } = await supabase
      .from('available_slots')
      .insert(slots)
      .select();
      
    if (error) throw error;
    
    return { count: data?.length || 0 };
  } catch (error) {
    console.error('Error creating available slots in bulk:', error);
    throw error;
  }
};
