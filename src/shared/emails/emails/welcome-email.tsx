import {
  Body,
  Container,
  Heading,
  Img,
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

export const WelcomeEmail = ({ fullName = "" }: Props) => {
  const firstName = fullName ? fullName.split(" ").at(0) : "";
  const text = `${firstName ? `Hi ${firstName}, ` : ""}Welcome to Midday! I'm Pontus, one of the founders. It's really important to us that you have a great experience ramping up.`;
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
            Welcome to Badget
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
            Welcome to Badget! I'm Matteo, one of the founders.
            <br />
            <br />
            We created Badget to make personal finance simple, clear, and
            stress-free. Managing money often feels complicated—we’ve been there
            ourselves—so we built Badget to give you control and peace of mind
            over your budgets, savings, and goals.
            <br />
            <br />
            Take your time to explore Badget at your own pace. You can connect
            your accounts, set up your first budget, or just start by tracking
            your spending—it’s entirely up to you.
            <br />
            <br />
            If you ever need a hand, just hit reply—we’re always one message
            away.
          </Text>

          <br />

          <Text
            className={themeClasses.mutedText}
            style={{ color: lightStyles.mutedText.color }}
          >
            Best regards, Matteo
          </Text>

          <style>{`
            .signature-blend {
              filter: none;
            }
            
            /* Regular dark mode - exclude Outlook.com */
            @media (prefers-color-scheme: dark) {
              .signature-blend:not([class^="x_"]) {
                filter: invert(1) brightness(1);
              }
            }
            
            /* Outlook.com specific dark mode targeting */
            [data-ogsb] .signature-blend,
            [data-ogsc] .signature-blend,
            [data-ogac] .signature-blend,
            [data-ogab] .signature-blend {
              filter: invert(1) brightness(1);
            }
          `}</style>

          <Img
            src={`/email/signature.png`}
            alt="Signature"
            className="signature-blend block h-[20px] w-[143px]"
          />

          <br />
          <br />

          <GetStarted />
        </Container>
      </Body>
    </EmailThemeProvider>
  );
};

export default WelcomeEmail;
