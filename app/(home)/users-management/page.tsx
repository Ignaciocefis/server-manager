import { PageTitle } from "../components/PageTitle";
import { CreateUserDialog } from "./components/CreateUser";

export default function UsersManagement() {
  return (
    <div className="flex flex-col items-center justify-center">
      <PageTitle title="Gestión de Usuarios">
        <CreateUserDialog />
      </PageTitle>
    </div>
  );
}
