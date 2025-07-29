import { useState, useEffect, useRef } from "react";
import language from "./language.json";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import Image from "next/image";
import { Styled } from "./LanguageSelection.styled";
import { useRouter } from "next/router";
import UsFlag from "./us.svg";
import DnFlag from "./dn.svg";

const LanguageSelections = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { push } = useRouter();
  const router = useRouter();

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleItemClick = (language: string) => {
    setSelectedItem(language);
    setIsOpen(false);
    push(
      {
        pathname: router.pathname,
      },
      undefined,
      { locale: language }
    );
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !(dropdownRef.current as any).contains(event.target)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const maps = { US: UsFlag, DK: DnFlag };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={toggleDropdown}
        className={`flex items-center justify-center`}
      >
        <Styled.HoverImage>
          <Image
            src="/assets/language.svg"
            height={42}
            width={42}
            alt="language-icon"
          />
        </Styled.HoverImage>

        {isOpen ? (
          <ArrowDropUp className="opacity-50" />
        ) : (
          <ArrowDropDown className="opacity-50" />
        )}
      </button>
      {isOpen && (
        <Styled.DropDownContainer ref={dropdownRef}>
          {language.map((item, i) => (
            <Styled.LanguageOption
              key={i}
              className={`dropDownOption ${
                selectedItem === item.localLang ? "selected" : ""
              }`}
              onClick={() => handleItemClick(item.localLang)}
            >
              <Image
                width={30}
                height={5}
                className="mr-3"
                src={maps[item.country]}
                alt={item.altFlagImg}
              />
              <h3 className="font-bold mt-0">{item.language}</h3>
            </Styled.LanguageOption>
          ))}
        </Styled.DropDownContainer>
      )}
    </div>
  );
};

export default LanguageSelections;
// https://freesvg.org/ for later svg's
