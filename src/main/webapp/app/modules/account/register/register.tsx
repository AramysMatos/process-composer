import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Translate, translate, ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { Button } from 'reactstrap';
import { toast } from 'react-toastify';

import PasswordStrengthBar from 'app/shared/layout/password/password-strength-bar';
import AuthSplitLayout from 'app/shared/layout/auth-split/auth-split-layout';
import AuthSplitPanel from 'app/shared/layout/auth-split/auth-split-panel';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { handleRegister, reset } from './register.reducer';

export const RegisterPage = () => {
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);
  const registrationSuccess = useAppSelector(state => state.register.registrationSuccess);

  useEffect(
    () => () => {
      dispatch(reset());
    },
    [dispatch]
  );

  const currentLocale = useAppSelector(state => state.locale.currentLocale);

  const handleValidSubmit = ({ username, email, firstPassword }) => {
    dispatch(handleRegister({ login: username, email, password: firstPassword, langKey: currentLocale }));
  };

  const updatePassword = event => setPassword(event.target.value);

  const successMessage = useAppSelector(state => state.register.successMessage);

  useEffect(() => {
    if (registrationSuccess && successMessage) {
      toast.success(translate(successMessage));
      dispatch(reset());
      navigate('/login', { replace: true });
    }
  }, [registrationSuccess, successMessage, dispatch, navigate]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthSplitLayout>
      <AuthSplitPanel
        wide
        titleId="register-title"
        titleDataCy="registerTitle"
        title={<Translate contentKey="register.welcome.title">Solicitar acesso</Translate>}
        subtitle={
          <Translate contentKey="register.welcome.subtitle">
            Crie sua conta para especificar processos e gerar tarefas de projeto.
          </Translate>
        }
        footer={
          <>
            <Translate contentKey="register.footer.hasAccount">Já tem conta?</Translate>{' '}
            <Link to="/login">
              <Translate contentKey="register.footer.signIn">Entrar</Translate>
            </Link>
          </>
        }
      >
        <ValidatedForm id="register-form" onSubmit={handleValidSubmit}>
          <ValidatedField
            name="username"
            label={translate('global.form.username.label')}
            placeholder={translate('global.form.username.placeholder')}
            validate={{
              required: { value: true, message: translate('register.messages.validate.login.required') },
              pattern: {
                value: /^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$/,
                message: translate('register.messages.validate.login.pattern'),
              },
              minLength: { value: 1, message: translate('register.messages.validate.login.minlength') },
              maxLength: { value: 50, message: translate('register.messages.validate.login.maxlength') },
            }}
            data-cy="username"
          />
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
            data-cy="email"
          />
          <ValidatedField
            name="firstPassword"
            label={translate('global.form.newpassword.label')}
            placeholder={translate('global.form.newpassword.placeholder')}
            type="password"
            onChange={updatePassword}
            validate={{
              required: { value: true, message: translate('global.messages.validate.newpassword.required') },
              minLength: { value: 4, message: translate('global.messages.validate.newpassword.minlength') },
              maxLength: { value: 50, message: translate('global.messages.validate.newpassword.maxlength') },
            }}
            data-cy="firstPassword"
          />
          <div className="auth-split__strength">
            <PasswordStrengthBar password={password} />
          </div>
          <ValidatedField
            name="secondPassword"
            label={translate('global.form.confirmpassword.label')}
            placeholder={translate('global.form.confirmpassword.placeholder')}
            type="password"
            validate={{
              required: { value: true, message: translate('global.messages.validate.confirmpassword.required') },
              minLength: { value: 4, message: translate('global.messages.validate.confirmpassword.minlength') },
              maxLength: { value: 50, message: translate('global.messages.validate.confirmpassword.maxlength') },
              validate: v => v === password || translate('global.messages.error.dontmatch'),
            }}
            data-cy="secondPassword"
          />
          <Button color="primary" type="submit" block id="register-submit" data-cy="submit">
            <Translate contentKey="register.form.button">Cadastrar</Translate>
          </Button>
        </ValidatedForm>
      </AuthSplitPanel>
    </AuthSplitLayout>
  );
};

export default RegisterPage;
