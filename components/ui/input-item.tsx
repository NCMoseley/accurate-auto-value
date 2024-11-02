import { cn } from "@/lib/utils";

const InputItem = ({
  id,
  className,
  children,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div id={id} className={cn("w-full sm:max-w-[300px]", className)}>
      {children}
    </div>
  );
};

export { InputItem };
