import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

/**
 * A component that renders a text input with a given question and a button that saves the input to a given state.
 *
 * @param {string} question - The question to be displayed above the text input.
 * @param {string} defaultText - The default text of the text input.
 * @param {(value: string | null) => void} setTextValue - The function to set the text input value to.
 * @param {boolean} numberOnly - Whether the input should only accept numbers.
 */
type TextInputProps = {
  question?: string;
  defaultText?: string | null;
  setTextValue: (value: string | null) => void;
  numberOnly?: boolean;
};

const TextInput = ({
  question = "-",
  defaultText = null,
  setTextValue,
  numberOnly = false
}: TextInputProps) => {
  const [upperText, setUpperText] = useState(
    // If the defaultText is null, set the state to an empty string, otherwise set it to the defaultText in uppercase
    defaultText === null ? "" : defaultText.toUpperCase()
  );

  const [textSelected, setTextSelected] = useState(false);

  useEffect(() => {
    // If the upperText is not empty, set the textValue to the upperText, otherwise set it to null
    if (upperText != "") {
      setTextValue(upperText);
    } else {
      setTextValue(null);
    }
  }, [setTextValue, upperText]);

  return (
    <Card className="flex-grow w-full">
      {/* when the text is selected on mobile, when clicking off of typing user doesn't accidentally click on something else */}
      {textSelected &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) && (
          <div className="absolute left-0 top-0 w-full h-full z-1"></div>
        )}
          <CardHeader className="text-2xl font-bold items-start">
            <CardTitle>{question}</CardTitle>
          </CardHeader>
          <CardContent className="w-full h-full">
            {/* Text input field */}
            <Input
              className="w-full h-12 text-2xl rounded-lg"
              type={numberOnly ? "number" : "text"}
              value={upperText}
              onChange={(e) => setUpperText(e.target.value.toUpperCase())}
              inputMode="search"
              onFocus={() => setTextSelected(true)}
              onBlur={() => setTextSelected(false)}
            />
          </CardContent>
    </Card>
  );
};

export default TextInput;
