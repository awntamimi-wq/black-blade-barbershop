import { describe, expect, it } from "vitest";
import { bookingErrorKey } from "@/lib/data";
import { bookingSchema } from "@/components/site/Booking";

describe("booking rules", () => {
  it("maps a double booking for the same barber and time to slot_taken", () => {
    expect(bookingErrorKey("slot_taken")).toBe("slot_taken");
    expect(bookingErrorKey('duplicate key value violates unique constraint "appointments_no_double"')).toBe("slot_taken");
  });
  it("rejects a booking without a valid phone number", () => {
    const base = { name: "Ali", phone: "abc", service: crypto.randomUUID(), barber: crypto.randomUUID(), date: "2030-01-01", time: "10:00" };
    expect(bookingSchema.safeParse(base).success).toBe(false);
    expect(bookingSchema.safeParse({ ...base, phone: "+962 790000000" }).success).toBe(true);
  });
});
