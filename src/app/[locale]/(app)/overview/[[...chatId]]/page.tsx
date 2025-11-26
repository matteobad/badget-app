import { AIDevtools } from "@ai-sdk-tools/devtools";
import { Provider as ChatProvider } from "@ai-sdk-tools/store";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Widgets } from "~/components/widgets";

import {
  getQueryClient,
  HydrateClient,
  prefetch,
  trpc,
} from "~/shared/helpers/trpc/server";

export const metadata: Metadata = {
  title: "Overview | Badget",
};

type Props = {
  params: Promise<{ chatId?: string[] }>;
};

export default async function Overview(props: Props) {
  const { chatId } = await props.params;

  // Extract the first chatId if it exists
  const currentChatId = chatId?.at(0);

  // const headersList = await headers();
  // const geo = geolocation({
  //   headers: headersList,
  // });

  const queryClient = getQueryClient();

  // Fetch widget preferences directly for initial data (no prefetch needed)
  const widgetPreferences = await queryClient.fetchQuery(
    trpc.widgets.getWidgetPreferences.queryOptions(),
  );

  // prefetch user widget preferences and settings
  prefetch(trpc.suggestedActions.list.queryOptions({ limit: 6 }));

  const chat = currentChatId
    ? await queryClient.fetchQuery(
        trpc.chat.get.queryOptions({ chatId: currentChatId }),
      )
    : null;

  if (currentChatId && !chat) {
    redirect("/overview");
  }

  return (
    <HydrateClient>
      <ChatProvider
        initialMessages={chat?.messages ?? []}
        key={currentChatId || "home"}
      >
        <Widgets initialPreferences={widgetPreferences} />

        {/* <ChatInterface geo={geo} /> */}

        {process.env.NODE_ENV === "development" && (
          <AIDevtools
            config={{
              streamCapture: {
                enabled: true,
                endpoint: `${process.env.NEXT_PUBLIC_API_URL}/chat`,
                autoConnect: true,
              },
            }}
          />
        )}
      </ChatProvider>
    </HydrateClient>
  );
}
