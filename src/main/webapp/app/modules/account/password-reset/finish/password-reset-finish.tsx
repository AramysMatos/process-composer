import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Translate, translate, ValidatedField, ValidatedForm } from 'react-jhipster';
import { Alert, Button } from 'reactstrap';
import { toast } from 'react-toastify';

import AuthSplitLayout from 'app/shared/layout/auth-split/auth-split-layout';
import AuthSplitPanel from 'app/shared/layout/auth-split/auth-split-panel';
import { handlePasswordResetFinish, reset } from '../password-reset.reducer';
import PasswordStrengthBar from 'app/shared/layout/password/password-strength-bar';
import { useAppDispatch, useAppSelector } from 'app/config/store';

export const PasswordResetFinishPage = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const key = searchParams.get('key');
  const [password, setPassword] = useState('');

  useEffect(
    () => () => {
      dispatch(reset());
    },
    [dispatch]
  );

  const handleValidSubmit = ({ newPassword }) => dispatch(handlePasswordResetFinish({ key, newPassword }));

  const updatePassword = event => setPassword(event.target.value);

  const successMessage = useAppSelector(state => state.passwordReset.successMessage);

  useEffect(() => {
    if (successMessage) {
      toast.success(translate(successMessage));
    }
  }, [successMessage]);

  const resetForm = (
    <ValidatedForm onSubmit={handleValidSubmit}>
      <ValidatedField
        name="newPassword"
        label={translate('global.form.newpassword.label')}
        placeholder={translate('global.form.newpassword.placeholder')}
        type="password"
        validate={{
          required: { value: true, message: translate('global.messages.validate.newpassword.required') },
          minLength: { value: 4, message: translate('global.messages.validate.newpassword.minlength') },
          maxLength: { value: 50, message: translate('global.messages.validate.newpassword.maxlength') },
        }}
        onChange={updatePassword}
        data-cy="resetPassword"
      />
      <div className="auth-split__strength">
        <PasswordStrengthBar password={password} />
      </div>
      <ValidatedField
        name="confirmPassword"
        label={translate('global.form.confirmpassword.label')}
        placeholder={translate('global.form.confirmpassword.placeholder')}
        type="password"
        validate={{
          required: { value: true, message: translate('global.messages.validate.confirmpassword.required') },
          minLength: { value: 4, message: translate('global.messages.validate.confirmpassword.minlength') },
          maxLength: { value: 50, message: translate('global.messages.validate.confirmpassword.maxlength') },
          validate: v => v === password || translate('global.messages.error.dontmatch'),
        }}
        data-cy="confirmResetPassword"
      />
      <Button color="primary" type="submit" block data-cy="submit">
        <Translate contentKey="reset.finish.form.button">Validar nova senha</Translate>
      </Button>
    </ValidatedForm>
  );

  return (
    <AuthSplitLayout>
      <AuthSplitPanel
        title={<Translate contentKey="reset.finish.welcome.title">Criar nova senha</Translate>}
        subtitle={
          key ? <Translate contentKey="reset.finish.welcome.subtitle">Escolha uma nova senha para acessar sua conta.</Translate> : undefined
        }
        footer={
          <Link to="/login">
            <Translate contentKey="reset.footer.backToLogin">Voltar ao login</Translate>
          </Link>
        }
      >
        {key ? (
          resetForm
        ) : (
          <Alert color="danger">
            <Translate contentKey="reset.finish.messages.keymissing">Chave de reestabelecimento não encontrada.</Translate>
            <p className="mb-0 mt-2">
              <Link to="/account/reset/request">
                <Translate contentKey="reset.request.welcome.title">Solicitar novo link</Translate>
              </Link>
            </p>
          </Alert>
        )}
      </AuthSplitPanel>
    </AuthSplitLayout>
  );
};

export default PasswordResetFinishPage;
