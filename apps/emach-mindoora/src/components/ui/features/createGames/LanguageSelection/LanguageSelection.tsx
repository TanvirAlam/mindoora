import * as Styled from "./LanguageSelection.styled";

export const LanguageSelection = ({ register }: { register: any }) => {
  return (
    <div>
      <Styled.StepSelect id="language" {...register("language")}>
        <option value="EN">🇬🇧 English</option>
        <option value="DA">🇩🇰 danish</option>
        <option value="DE">🇩🇪 German</option>
        <option value="FR">🇫🇷 French</option>
        <option value="ES">🇪🇸 Spanish</option>
      </Styled.StepSelect>
    </div>
  );
};
