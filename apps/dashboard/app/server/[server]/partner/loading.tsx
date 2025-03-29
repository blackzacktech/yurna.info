import { Skeleton } from "@/components/ui/Skeletons";
import Header, { headerVariants } from "@/components/ui/Headers";
import { Icons, iconVariants } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { Block } from "@/components/ui/Block";

export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <Header className={cn(headerVariants({ variant: "h1", margin: "normal" }))}>
        <Icons.HandShake className={iconVariants({ variant: "extraLarge" })} />
        <Skeleton className="h-8 w-64" />
      </Header>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Block key={i} className="flex flex-col">
            <div className="relative aspect-[2/1] w-full overflow-hidden rounded-t-lg">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="flex-1 p-4">
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          </Block>
        ))}
      </div>
    </div>
  );
}
