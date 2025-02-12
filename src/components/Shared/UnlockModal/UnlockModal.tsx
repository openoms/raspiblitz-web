import { FC, useContext, useState } from "react";
import { createPortal } from "react-dom";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ReactComponent as LockOpen } from "../../../assets/lock-open.svg";
import ModalDialog, {
  disableScroll,
} from "../../../container/ModalDialog/ModalDialog";
import { AppContext } from "../../../store/app-context";
import { instance } from "../../../util/interceptor";
import { MODAL_ROOT } from "../../../util/util";
import ButtonWithSpinner from "../ButtonWithSpinner/ButtonWithSpinner";
import InputField from "../InputField/InputField";

interface IFormInputs {
  passwordInput: string;
}

type Props = {
  onClose: (unlocked: boolean) => void;
};

const UnlockModal: FC<Props> = ({ onClose }) => {
  const { t } = useTranslation();
  const { setWalletLocked } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordWrong, setPasswordWrong] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IFormInputs>({ mode: "onChange" });

  const unlockHandler: SubmitHandler<IFormInputs> = (data: {
    passwordInput: string;
  }) => {
    setIsLoading(true);
    setPasswordWrong(false);
    instance
      .post("/lightning/unlock-wallet", { password: data.passwordInput })
      .then((res) => {
        if (res.data) {
          setWalletLocked(false);
          // disableScroll doesn't trigger on modal close
          disableScroll.off();
          onClose(true);
        }
      })
      .catch((_) => {
        setIsLoading(false);
        setPasswordWrong(true);
      });
  };

  return createPortal(
    <ModalDialog closeable={false} close={() => onClose(false)}>
      <h2 className="mt-5 text-lg font-bold">{t("wallet.unlock_title")}</h2>

      <div>
        <h3 className="p-2">{t("wallet.unlock_subtitle")}</h3>

        <form onSubmit={handleSubmit(unlockHandler)}>
          <InputField
            {...register("passwordInput", {
              required: t("forms.validation.unlock.required"),
            })}
            autoFocus
            errorMessage={errors.passwordInput}
            label={t("forms.validation.unlock.pass_c")}
            placeholder={t("forms.validation.unlock.pass_c")}
            type="password"
            disabled={isLoading}
          />
          <ButtonWithSpinner
            type="submit"
            className="bd-button my-5 p-3"
            loading={isLoading}
            disabled={!isValid}
            icon={<LockOpen className="mx-1 h-6 w-6" />}
          >
            {isLoading ? t("wallet.unlocking") : t("wallet.unlock")}
          </ButtonWithSpinner>
        </form>
      </div>

      {passwordWrong && (
        <p className="mb-5 text-red-500">{t("login.invalid_pass")}</p>
      )}
    </ModalDialog>,
    MODAL_ROOT
  );
};

export default UnlockModal;
