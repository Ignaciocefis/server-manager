import { ReactNode } from "react";

export interface PageTitleProps {
  title: string;
  dialogAction?: {
    label: string;
    icon?: ReactNode;
    content: ReactNode | ((props: { closeDialog: () => void }) => ReactNode);
  };
  secondaryAction?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
  children?: ReactNode;
}
