import { Skeleton } from "@/components/ui/Skeletons";
import Header, { headerVariants } from "@/components/ui/Headers";
import { Icons, iconVariants } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { Block } from "@/components/ui/Block";

export default function Loading() {
  return (
    <>
      <Header className={cn(headerVariants({ variant: "h1", margin: "normal" }))}>
        <Icons.Users className={iconVariants({ variant: "extraLarge" })} />
        Partner Servers
      </Header>
      <p className="mb-4 text-left text-base md:text-lg">
        <Skeleton className="h-6 w-full" />
      </p>

      <Block className="mt-4">
        <Header className={cn(headerVariants({ variant: "h2" }))}>
          <Icons.HandShake className={iconVariants({ variant: "large", className: "stroke-2!" })} />
          Partner Servers
        </Header>
        <p className="mb-4 text-left">
          <Skeleton className="h-6 w-full" />
        </p>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Block key={i}>
              <div className="flex justify-between">
                <Skeleton className="h-6 w-40" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
              <Skeleton className="mt-2 h-20 w-full" />
            </Block>
          ))}
        </div>
      </Block>
    </>
  );
}
