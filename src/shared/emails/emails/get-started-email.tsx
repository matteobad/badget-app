import {
  Body,
  Container,
  Heading,
  Preview,
  Text,
} from "@react-email/components";

import { GetStarted } from "../components/get-started";
import { Logo } from "../components/logo";
import {
  EmailThemeProvider,
  getEmailInlineStyles,
  getEmailThemeClasses,
} from "../components/theme";

interface Props {
  fullName: string;
}

export const GetStartedEmail = ({ fullName = "" }: Props) => {
  const firstName = fullName ? fullName.split(" ").at(0) : "";
  const text = `${firstName ? `Hi ${firstName}, ` : ""}Just checking in to help you get started. Here are a few things you can try today.`;
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
            Get the most out of Badget
          </Heading>

          <br />

          <span
            className={`font-medium ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            {firstName ? `Hi ${firstName},` : "Hello,"}
          </span>

          <Text
            className={themeClasses.text}
            style={{ color: lightStyles.text.color }}
          >
            Just checking in to help you get started. Here are a few things you
            can try today:
          </Text>
          <br />
          <ul
            className={`list-none pl-0 text-[14px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            <li className="mb-2">
              <Text>
                <strong>Connect your bank account</strong> – Get a clear
                financial overview.
              </Text>
            </li>
            <li className="mb-2">
              <Text>
                <strong>Track your cash and valuables</strong> – Stay on top of
                all your assets, not just those in the bank.
              </Text>
            </li>
            <li className="mb-2">
              <Text>
                <strong>Store important files</strong> – Keep contracts and
                agreements secure in Vault.
              </Text>
            </li>
            <li className="mb-2">
              <Text>
                <strong>Use the assistant</strong> – Gain insights and get a
                deeper understanding of your finances.
              </Text>
            </li>
          </ul>
          <br />
          <Text
            className={`text-[14px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            Let us know if you have any thoughts or feedback—we'd love to hear
            from you. Just hit reply.
          </Text>
          <br />
          <Text
            className={`text-[14px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            Best,
            <br />
            Matteo
          </Text>

          <br />

          <GetStarted />
        </Container>
      </Body>
    </EmailThemeProvider>
  );
};

export default GetStartedEmail;
