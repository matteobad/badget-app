import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "../ui/button";

type Props = {
  onClick: () => void;
};

export function BankConnectButton({ onClick }: Props) {
  const [isLoading, setLoading] = useState(false);

  const handleOnClick = () => {
    setLoading(true);
    onClick();

    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  return (
    <Button
      variant="outline"
      data-event="Bank Selected"
      data-icon="🏦"
      data-channel="bank"
      disabled={isLoading}
      onClick={handleOnClick}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
    </Button>
  );
}
