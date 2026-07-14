import type { Metadata } from "next";
import ToppingsView from "./ToppingsView";

export const metadata: Metadata = {
  title: "Toppings | The Pufflette.co",
  description: "Add-on toppings priced individually — pick as many as you like at checkout.",
};

export default function ToppingsPage() {
  return <ToppingsView />;
}
