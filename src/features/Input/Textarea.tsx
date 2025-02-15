interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const Textarea: React.FC<TextareaProps> = ({ value, onChange, onSubmit }) => {
  return (
    <textarea
      className={[
        `rounded`,
        `border`,
        `px-3 py-3`,
        `border outline-none`,
        `text-black`,
        `w-[600px] min-h-[60px] max-h-[200px]`,
      ].join(" ")}
      value={value}
      // @ts-expect-error - New prop fieldSizing
      style={{ fieldSizing: "content" }}
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
