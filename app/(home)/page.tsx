import { CreateServerDialog } from "./components/CreateServer";
import { PageTitle } from "./components/PageTitle";
import { ServerList } from "./components/ServerList";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <PageTitle title="Listado de servidores">
        <CreateServerDialog />
      </PageTitle>
      <ServerList />
    </div>
  );
}
