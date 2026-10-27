import {
  BookOpen,
  Cake,
  Camera,
  Candy,
  CloudSun,
  Coffee,
  EighthNotes,
  FaceGrinning,
  FaceSlightlySmiling,
  Feather,
  Flower2,
  Footprints,
  Gem,
  Gift,
  HandHeart,
  Heart,
  House,
  Infinity as InfinityIcon,
  Leaf,
  Lightbulb,
  MapPin,
  Moon,
  Mountain,
  PartyPopper,
  Plane,
  Sparkles,
  Star,
  Sun,
  Umbrella,
  Utensils,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/content/types";

const ICONS: Record<IconName, LucideIcon> = {
  book: BookOpen,
  cake: Cake,
  camera: Camera,
  candy: Candy,
  "cloud-sun": CloudSun,
  coffee: Coffee,
  feather: Feather,
  flower: Flower2,
  footprints: Footprints,
  gem: Gem,
  gift: Gift,
  "hand-heart": HandHeart,
  heart: Heart,
  home: House,
  infinity: InfinityIcon,
  laugh: FaceGrinning,
  leaf: Leaf,
  lightbulb: Lightbulb,
  "map-pin": MapPin,
  moon: Moon,
  mountain: Mountain,
  music: EighthNotes,
  party: PartyPopper,
  plane: Plane,
  smile: FaceSlightlySmiling,
  sparkles: Sparkles,
  star: Star,
  sun: Sun,
  umbrella: Umbrella,
  utensils: Utensils,
};

interface IconProps extends LucideProps {
  name: IconName;
}

/** A decorative icon chosen by name from the content file. */
export function Icon({ name, ...props }: IconProps) {
  const Component = ICONS[name] ?? Heart;
  return <Component aria-hidden="true" {...props} />;
}
