import { Hero } from "~/components/home/hero";

export const revalidate = 1800;

export default function HomePage() {
  return <Hero />;
}
