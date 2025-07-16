import { CreateServerDialog, GpuReservationsList } from "./components";
import { PageTitle } from "./components/PageTitle";
import { ServerList } from "./components/Server/ServerList";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <PageTitle title="Listado de servidores">
        <CreateServerDialog />
      </PageTitle>
      <h2 className="mt-8 text-2xl font-semibold text-gray-app-600">
        Mis tarjetas gráficas reservadas
      </h2>
      <GpuReservationsList />
      <hr className="w-4/5 mx-auto border-t-2 border-gray-app-600" />
      <h2 className="mt-8 text-2xl font-semibold text-gray-app-600">
        Mis servidores disponibles
      </h2>
      <ServerList />
    </div>
  );
}
