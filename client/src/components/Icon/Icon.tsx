import { type IconName, icons } from "@/assets/icons";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export default function Icon({ name, ...props }: IconProps) {
  const Component = icons[name];
  return <Component {...props} />;
}
