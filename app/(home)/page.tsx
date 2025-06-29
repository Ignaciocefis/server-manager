import { CreateServerDialog } from "./components/CreateServer";
import { PageTitle } from "./components/PageTitle";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <PageTitle title="Listado de servidores">
        <CreateServerDialog />
      </PageTitle>
    </div>
  );
}
