import { NotFoundPage } from "@/features/NotFound/NotFoundPage";

export const metadata = {
  title: "Not Found",
  description: "Not Found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  const supportedLang = "en";
  return <NotFoundPage lang={supportedLang} />;
}
