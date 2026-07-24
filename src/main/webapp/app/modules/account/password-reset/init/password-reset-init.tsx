import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Translate, translate, ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { Button } from 'reactstrap';
import { toast } from 'react-toastify';

import AuthSplitLayout from 'app/shared/layout/auth-split/auth-split-layout';
import AuthSplitPanel from 'app/shared/layout/auth-split/auth-split-panel';
import { handlePasswordResetInit, reset } from '../password-reset.reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';

export const PasswordResetInit = () => {
  const dispatch = useAppDispatch();

  useEffect(
    () => () => {
      dispatch(reset());
    },
    [dispatch]
  );

  const handleValidSubmit = ({ email }) => {
    dispatch(handlePasswordResetInit(email));
  };

  const successMessage = useAppSelector(state => state.passwordReset.successMessage);

  useEffect(() => {
    if (successMessage) {
      toast.success(translate(successMessage));
    }
  }, [successMessage]);

  return (
    <AuthSplitLayout>
      <AuthSplitPanel
        title={<Translate contentKey="reset.request.welcome.title">Esqueceu sua senha?</Translate>}
        subtitle={
          <Translate contentKey="reset.request.welcome.subtitle">
            Informe o e-mail usado no cadastro. Enviaremos instruções para criar uma nova senha.
          </Translate>
        }
        footer={
          <>
            <Translate contentKey="reset.footer.backToLogin">Voltar ao</Translate>{' '}
            <Link to="/login">
              <Translate contentKey="login.form.button">Entrar</Translate>
            </Link>
          </>
        }
      >
        <ValidatedForm onSubmit={handleValidSubmit}>
          <ValidatedField
            name="email"
            label={translate('global.form.email.label')}
            placeholder={translate('global.form.email.placeholder')}
            type="email"
            validate={{
              required: { value: true, message: translate('global.messages.validate.email.required') },
              minLength: { value: 5, message: translate('global.messages.validate.email.minlength') },
              maxLength: { value: 254, message: translate('global.messages.validate.email.maxlength') },
              validate: v => isEmail(v) || translate('global.messages.validate.email.invalid'),
            }}
            data-cy="emailResetPassword"
          />
          <Button color="primary" type="submit" block data-cy="submit">
            <Translate contentKey="reset.request.form.button">Enviar instruções</Translate>
          </Button>
        </ValidatedForm>
      </AuthSplitPanel>
    </AuthSplitLayout>
  );
};

export default PasswordResetInit;
