import Image from "next/image";
import { AppImageProps } from "./AppImage.types";

export function AppImage({ width = 100, height = 45 }: AppImageProps) {
  return (
    <Image
      src="/logo-minerva.webp"
      alt="App para la gestión de servidores de Minerva Artificial Intelligence Research Lab"
      width={width}
      height={height}
      className="object-contain align-middle"
    />
  );
}
