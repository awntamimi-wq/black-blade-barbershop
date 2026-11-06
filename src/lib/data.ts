import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import barber1 from "@/assets/barber-1.jpg";
import barber2 from "@/assets/barber-2.jpg";
import barber3 from "@/assets/barber-3.jpg";

export const BARBER_PHOTOS: Record<string, string> = { omar: barber1, karim: barber2, yousef: barber3 };

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async () => {
    const { data, error } = await supabase.from("services").select("*").order("sort");
    if (error) throw error;
    return data;
  },
});

export const barbersQuery = queryOptions({
  queryKey: ["barbers"],
  queryFn: async () => {
    const { data, error } = await supabase.from("barbers").select("*").eq("active", true).order("sort");
    if (error) throw error;
    return data;
  },
});

export const bookedSlotsQuery = (barber: string, date: string) =>
  queryOptions({
    queryKey: ["slots", barber, date],
    enabled: !!barber && !!date,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_booked_slots", { _barber: barber, _date: date });
      if (error) throw error;
      return (data as unknown as string[]).map((t) => t.slice(0, 5));
    },
  });

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isPastSlot(date: string, time: string) {
  return new Date(`${date}T${time}:00`).getTime() < Date.now();
}

/** Map a database error message to a known booking error key. */
export function bookingErrorKey(message: string | undefined) {
  const keys = ["slot_taken", "past_slot", "invalid_name", "invalid_phone"] as const;
  const hit = keys.find((k) => message?.includes(k));
  if (hit === "invalid_name") return "name";
  if (hit === "invalid_phone") return "phone";
  if (message?.includes("appointments_no_double") || message?.includes("duplicate key")) return "slot_taken";
  return hit ?? "generic";
}
