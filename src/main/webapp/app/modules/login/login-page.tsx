import React from 'react';
import { Link } from 'react-router-dom';
import { Translate, translate, ValidatedField } from 'react-jhipster';
import { Alert, Button, Form } from 'reactstrap';
import { useForm } from 'react-hook-form';

import AuthSplitLayout from 'app/shared/layout/auth-split/auth-split-layout';
import AuthSplitPanel from 'app/shared/layout/auth-split/auth-split-panel';

export interface ILoginPageProps {
  loginError: boolean;
  loading: boolean;
  handleLogin: (username: string, password: string, rememberMe: boolean) => void;
}

type LoginForm = {
  username: string;
  password: string;
  rememberMe?: boolean;
};

const LoginPage = ({ loginError, loading, handleLogin }: ILoginPageProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm({ mode: 'onTouched' });

  const onSubmit = (values: LoginForm) => {
    handleLogin(values.username, values.password, Boolean(values.rememberMe));
  };

  return (
    <AuthSplitLayout>
      <AuthSplitPanel
        titleId="login-title"
        titleDataCy="loginTitle"
        title={<Translate contentKey="login.welcome.title">Bem-vindo de volta</Translate>}
        subtitle={
          <Translate contentKey="login.welcome.subtitle">
            Acesse sua conta para continuar especificando processos e gerando tarefas.
          </Translate>
        }
        footer={
          <>
            <Translate contentKey="login.footer.new">Novo por aqui?</Translate>{' '}
            <Link to="/account/register">
              <Translate contentKey="login.footer.requestAccess">Solicitar acesso</Translate>
            </Link>
          </>
        }
      >
        <Form
          id="login-page"
          data-cy="login-page"
          onSubmit={e => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          {loginError ? (
            <Alert color="danger" data-cy="loginError">
              <Translate contentKey="login.messages.error.authentication">
                <strong>Erro de autenticação!</strong> Por favor verifique suas credenciais e tente novamente.
              </Translate>
            </Alert>
          ) : null}

          <ValidatedField
            name="username"
            label={translate('login.form.email')}
            placeholder={translate('login.form.email.placeholder')}
            required
            autoFocus
            type="email"
            data-cy="username"
            register={register}
            error={errors.username}
            isTouched={touchedFields.username}
            validate={{ required: translate('login.form.email.required') }}
          />
          <ValidatedField
            name="password"
            type="password"
            label={translate('login.form.password')}
            placeholder={translate('login.form.password.placeholder')}
            required
            data-cy="password"
            register={register}
            error={errors.password}
            isTouched={touchedFields.password}
            validate={{ required: translate('login.form.password.required') }}
          />

          <div className="auth-split__row-between">
            <ValidatedField name="rememberMe" type="checkbox" check label={translate('login.form.rememberme')} register={register} />
            <Link to="/account/reset/request" data-cy="forgetYourPasswordSelector">
              <Translate contentKey="login.password.forgot">Esqueci minha senha</Translate>
            </Link>
          </div>

          <Button color="primary" type="submit" block data-cy="submit" disabled={loading}>
            <Translate contentKey="login.form.button">Entrar</Translate>
          </Button>
        </Form>
      </AuthSplitPanel>
    </AuthSplitLayout>
  );
};

export default LoginPage;
