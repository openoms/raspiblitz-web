import { ChangeEvent, FC, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ReactComponent as RefreshIcon } from "../../../assets/refresh.svg";
import { ReactComponent as XIcon } from "../../../assets/X.svg";
import ModalDialog from "../../../container/ModalDialog/ModalDialog";
import { instance } from "../../../util/interceptor";
import { MODAL_ROOT } from "../../../util/util";
import ButtonWithSpinner from "../../Shared/ButtonWithSpinner/ButtonWithSpinner";
import InputField from "../../Shared/InputField/InputField";

export type Props = {
  onClose: () => void;
};
interface IFormInputs {
  oldPassword: string;
  newPassword: string;
}

const ChangePwModal: FC<Props> = ({ onClose }) => {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const changePwHandler = async () => {
    setIsLoading(true);
    const params = {
      type: "a",
      old_password: oldPassword,
      new_password: newPassword,
    };
    await instance
      .post("/system/change-password", {}, { params })
      .then((resp) => {
        toast.success(t("settings.pass_a_changed"));
        onClose();
      })
      .catch((err) => {
        toast.error(err.response.data.detail || err.response.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onChangeOldPw = (event: ChangeEvent<HTMLInputElement>) => {
    setOldPassword(event.target.value);
  };

  const onChangeNewPw = (event: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(event.target.value);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IFormInputs>({
    mode: "onChange",
  });

  return createPortal(
    <ModalDialog close={onClose}>
      <h3 className="font-bold">{t("settings.change_pw_a")}</h3>
      <form
        className="my-5 flex flex-col items-center justify-center text-center"
        onSubmit={handleSubmit(changePwHandler)}
      >
        <article className="w-full py-2 md:w-10/12">
          <InputField
            {...register("oldPassword", {
              required: t("setup.password_error_empty"),
              pattern: {
                value: /^[a-zA-Z0-9]*$/,
                message: t("setup.password_error_chars"),
              },
              minLength: {
                value: 8,
                message: t("setup.password_error_length"),
              },
              onChange: onChangeOldPw,
            })}
            value={oldPassword}
            label={t("settings.old_pw")}
            errorMessage={errors.oldPassword}
          />
        </article>
        <article className="w-full py-2 md:w-10/12">
          <InputField
            {...register("newPassword", {
              required: t("setup.password_error_empty"),
              pattern: {
                value: /^[a-zA-Z0-9]*$/,
                message: t("setup.password_error_chars"),
              },
              minLength: {
                value: 8,
                message: t("setup.password_error_length"),
              },
              onChange: onChangeNewPw,
            })}
            value={newPassword}
            label={t("settings.new_pw")}
            errorMessage={errors.newPassword}
          />
        </article>
        <article className="flex w-full flex-col justify-around gap-6 pt-8 text-white md:w-2/3 xl:flex-row">
          <button
            className="flex items-center justify-center rounded bg-red-500 px-2 text-white shadow-xl hover:bg-red-400 disabled:bg-gray-400"
            onClick={onClose}
            type="button"
          >
            <XIcon className="inline h-6 w-6" />
            <span className="p-2">{t("settings.cancel")}</span>
          </button>
          <ButtonWithSpinner
            type="submit"
            className="bd-button flex items-center justify-center px-2 disabled:bg-gray-400"
            disabled={!isValid}
            loading={isLoading}
            icon={<RefreshIcon className="inline h-6 w-6" />}
          >
            <span className="p-2">{t("settings.change_pw_a")}</span>
          </ButtonWithSpinner>
        </article>
      </form>
    </ModalDialog>,
    MODAL_ROOT
  );
};

export default ChangePwModal;
