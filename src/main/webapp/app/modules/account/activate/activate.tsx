import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Translate } from 'react-jhipster';
import { Alert } from 'reactstrap';

import AuthSplitLayout from 'app/shared/layout/auth-split/auth-split-layout';
import AuthSplitPanel from 'app/shared/layout/auth-split/auth-split-panel';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { activateAction, reset } from './activate.reducer';

export const ActivatePage = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { activationSuccess, activationFailure } = useAppSelector(state => state.activate);

  useEffect(() => {
    const activationKey = searchParams.get('key') ?? '';
    dispatch(activateAction(activationKey));
    return () => {
      dispatch(reset());
    };
  }, [dispatch, searchParams]);

  const pending = !activationSuccess && !activationFailure;

  return (
    <AuthSplitLayout>
      <AuthSplitPanel
        title={<Translate contentKey="activate.welcome.title">Ativação de conta</Translate>}
        subtitle={pending ? <Translate contentKey="activate.welcome.subtitle">Estamos ativando sua conta…</Translate> : undefined}
      >
        {activationSuccess ? (
          <Alert color="success">
            <Translate contentKey="activate.messages.success">
              <strong>Sua conta de usuário foi ativada com sucesso.</strong> Favor
            </Translate>{' '}
            <Link to="/login" className="alert-link">
              <Translate contentKey="global.messages.info.authenticated.link">entrar</Translate>
            </Link>
            .
          </Alert>
        ) : null}
        {activationFailure ? (
          <Alert color="danger">
            <Translate contentKey="activate.messages.error">
              <strong>Seu usuário não pode ser ativado.</strong> Favor utilizar o formulário de cadastro para criar uma nova conta.
            </Translate>
            <p className="mb-0 mt-2">
              <Link to="/account/register" className="alert-link">
                <Translate contentKey="login.footer.requestAccess">Solicitar acesso</Translate>
              </Link>
            </p>
          </Alert>
        ) : null}
      </AuthSplitPanel>
    </AuthSplitLayout>
  );
};

export default ActivatePage;
