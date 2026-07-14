import type { Metadata } from "next";
import MenuView from "./MenuView";

export const metadata: Metadata = {
  title: "Menu | The Pufflette.co",
  description: "Gourmet pancake and puff puff boxes in Abuja — every size and price, freshly made.",
};

export default function MenuPage() {
  return <MenuView />;
}
