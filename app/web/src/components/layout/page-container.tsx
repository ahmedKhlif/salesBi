import { PropsWithChildren } from "react";

export function PageContainer({ children }: PropsWithChildren) {
  return <main className="flex-1 min-w-0 overflow-x-clip px-4 pb-10 pt-6 md:px-8">{children}</main>;
}
