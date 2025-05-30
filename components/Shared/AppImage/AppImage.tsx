import Image from "next/image";

export function AppImage({
  width = 100,
  height = 45,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <div className="flex justify-center">
      <Image
        src="/logo-minerva.png"
        alt="Logo Minerva. App para la gestión de servidores de Minerva Machine Learning"
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  );
}
