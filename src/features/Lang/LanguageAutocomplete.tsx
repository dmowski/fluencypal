import React from "react";

import { FilterOptionsState, Stack, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { LanguageInfo } from "@/libs/languages";

const isOptionAvailable = (option: SelectGroupItem, inputValue: string) => {
  return (
    option.englishName.toLowerCase().includes(inputValue.toLowerCase()) ||
    option.nativeName.toLowerCase().includes(inputValue.toLowerCase())
  );
};

const filterHandler = (options: SelectGroupItem[], params: FilterOptionsState<SelectGroupItem>) => {
  const { inputValue } = params;
  const filtered = options.filter((option) => isOptionAvailable(option, inputValue));
  return filtered;
};

export interface SelectGroupItem extends LanguageInfo {
  groupTitle: string;
}

interface LanguageAutocompleteProps {
  options: SelectGroupItem[];
  value: SelectGroupItem | null;
  label?: string;
  onChange: (valueCode: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
}

const LanguageAutocomplete: React.FC<LanguageAutocompleteProps> = ({
  options,
  placeholder,
  value,
  label,
  onChange,
  required,
  id,
  disabled,
}) => {
  return (
    <Autocomplete
      options={options}
      disabled={disabled}
      sx={{
        width: "100%",
      }}
      groupBy={(option) => {
        const group = options.find((group) => group.code === option.code);
        return group?.groupTitle || "Other";
      }}
      getOptionLabel={(option) => {
        return option.englishName;
      }}
      renderGroup={(params) => {
        return (
          <Stack key={params.key}>
            <Typography
              sx={{
                padding: "8px 10px",
              }}
              variant="caption"
            >
              {params.group}
            </Typography>
            <Stack
              sx={{
                paddingLeft: "0px",
              }}
            >
              {params.children}
            </Stack>
          </Stack>
        );
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.code}>
          <Stack
            direction={"row"}
            gap={"8px"}
            alignItems={"center"}
            sx={{
              padding: "3px 10px",
            }}
          >
            <Stack
              sx={{
                alignItems: "center",
                display: "flex",
                flexDirection: "row",
                width: "100%",
                justifyContent: "flex-start",
                padding: "0px 5px",
                gap: "15px",
                minHeight: "42px",
              }}
            >
              <Stack>
                <Typography>{option.englishName}</Typography>
                <Typography variant="caption">{option.nativeName}</Typography>
              </Stack>
            </Stack>
          </Stack>
        </li>
      )}
      value={value || null}
      id={id}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder || `Start type or choose from list`}
          label={label}
          required={required}
          onBlur={(e) => {
            const appropriateOption = options.find((option) =>
              isOptionAvailable(option, e.target.value)
            );
            if (appropriateOption) {
              onChange(appropriateOption.code);
            }
          }}
        />
      )}
      onChange={(_, newValue) => onChange(newValue?.code || "")}
      filterOptions={(options, params) => filterHandler(options, params)}
    />
  );
};

export default LanguageAutocomplete;
