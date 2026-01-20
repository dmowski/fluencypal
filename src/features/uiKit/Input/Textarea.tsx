import { TextField } from "@mui/material";

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  onSubmit,
}) => {
  return (
    <TextField
      sx={{
        width: "600px",
        maxWidth: "calc(100vw - 80px)",
      }}
      value={value}
      multiline
      placeholder="Type your message here..."
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        const isEnter = e.key === "Enter";
        const isCtrl = e.ctrlKey;
        const isCommand = e.metaKey;
        if (isEnter && (isCtrl || isCommand)) {
          e.preventDefault();
          onSubmit();
        }
      }}
    />
  );
};
