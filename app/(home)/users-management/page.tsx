import { PageTitle } from "../components/PageTitle";
import { CreateUserDialog } from "./components/CreateUser";
import { UserTable } from "./components/UsersTable";

export default function UsersManagement() {
  return (
    <div className="flex flex-col items-center justify-center">
      <PageTitle title="Gestión de Usuarios">
        <CreateUserDialog />
      </PageTitle>
      <UserTable />
    </div>
  );
}
