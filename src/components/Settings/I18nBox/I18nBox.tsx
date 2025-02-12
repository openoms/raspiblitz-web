import { FC } from "react";
import { useTranslation } from "react-i18next";
import I18nDropdown from "../../Shared/I18nDropdown/I18nDropdown";

const I18nBox: FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="box-border w-full px-5 pt-5 transition-colors dark:text-white lg:w-1/2">
      <div className="flex flex-col rounded bg-white p-5 shadow-xl dark:bg-gray-800">
        <div className="my-2 flex w-full justify-center">
          {t("settings.curr_lang")}:&nbsp;<strong>{i18n.language}</strong>
        </div>
        <div className="flex justify-between">
          <I18nDropdown />
        </div>
      </div>
    </div>
  );
};

export default I18nBox;
