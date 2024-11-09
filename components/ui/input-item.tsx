import { cn } from "@/lib/utils";

const InputItem = ({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("w-full sm:max-w-[300px]", className)}>{children}</div>
  );
};

export { InputItem };
