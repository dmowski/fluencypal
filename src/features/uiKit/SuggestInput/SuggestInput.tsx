import React from "react";

import {
  FilterOptionsState,
  Stack,
  Typography,
  createFilterOptions,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const filter = createFilterOptions<string>();

const filterHandler = (
  options: string[],
  params: FilterOptionsState<string>,
  isStrict?: boolean,
) => {
  const filtered = filter(options, params);
  const { inputValue } = params;
  const isExisting = options.some((option) => inputValue === option);
  if (!isExisting && inputValue && !isStrict) {
    filtered.push(inputValue);
  }
  return filtered;
};

export interface SelectGroupItem {
  value: string;
  groupTitle: string;
}

interface SuggestInputProps {
  options: string[];
  value: string;
  label?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  groups?: SelectGroupItem[];
  strict?: boolean;
  disabled?: boolean;
}

const SuggestInput: React.FC<SuggestInputProps> = ({
  options,
  placeholder,
  groups,
  value,
  label,
  onChange,
  required,
  id,
  strict,
  disabled,
}) => {
  return (
    <Autocomplete
      options={options}
      disabled={disabled}
      groupBy={
        groups
          ? (option) => {
              const group = groups.find((group) => group.value === option);
              return group?.groupTitle || "Other";
            }
          : undefined
      }
      getOptionLabel={
        groups
          ? (option) => {
              const group = groups.find((group) => group.value === option);
              return group ? group.value : option;
            }
          : undefined
      }
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
        <li {...props} key={option}>
          <Stack
            direction={"row"}
            gap={"8px"}
            alignItems={"center"}
            sx={{
              padding: groups ? "3px 10px" : "3 0px",
            }}
          >
            {option}
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
          onBlur={(e) => onChange(e.target.value)}
        />
      )}
      onChange={(_, newValue) => onChange(newValue || "")}
      filterOptions={(options, params) =>
        filterHandler(options, params, strict)
      }
    />
  );
};

export default SuggestInput;
