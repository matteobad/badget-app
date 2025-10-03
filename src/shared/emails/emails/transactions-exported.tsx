import {
  Body,
  Container,
  Heading,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { Button } from "../components/button";
import { Logo } from "../components/logo";
import {
  EmailThemeProvider,
  getEmailInlineStyles,
  getEmailThemeClasses,
} from "../components/theme";

interface Props {
  accountantEmail: string;
  teamName: string;
  transactionCount: number;
  downloadLink: string;
}

export const TransactionsExportedEmail = ({
  accountantEmail = "accountant@example.com",
  teamName = "Badget",
  transactionCount = 100,
  downloadLink = "https://app.midday.ai/s/abc123",
}: Props) => {
  const text = `Transaction Export from ${teamName}`;
  const themeClasses = getEmailThemeClasses();
  const lightStyles = getEmailInlineStyles("light");

  return (
    <EmailThemeProvider preview={<Preview>{text}</Preview>}>
      <Body
        className={`mx-auto my-auto font-sans ${themeClasses.body}`}
        style={lightStyles.body}
      >
        <Container
          className={`mx-auto my-[40px] max-w-[600px] p-[20px] ${themeClasses.container}`}
          style={{
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: lightStyles.container.borderColor,
          }}
        >
          <Logo />
          <Heading
            className={`mx-0 my-[30px] p-0 text-center text-[21px] font-normal ${themeClasses.heading}`}
            style={{ color: lightStyles.text.color }}
          >
            Transaction Export from {teamName}
          </Heading>

          <br />

          <span
            className={`font-medium ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            Hi,
          </span>
          <Text
            className={themeClasses.text}
            style={{ color: lightStyles.text.color }}
          >
            {teamName} has shared a transaction export with you containing{" "}
            {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}.
            Click the button below to download the file.
          </Text>

          <Section className="mt-[50px] mb-[50px] text-center">
            <Button href={downloadLink}>Download Export</Button>
          </Section>

          <Text
            className={`text-[12px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            This link will expire in 7 days. If you have any questions about
            this export, please contact {teamName}.
          </Text>

          <br />
        </Container>
      </Body>
    </EmailThemeProvider>
  );
};

export default TransactionsExportedEmail;
