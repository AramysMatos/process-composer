import './platform-settings.scss';

import React, { useEffect } from 'react';
import { Alert, Card, CardBody, CardTitle, FormGroup, Input, Label, Spinner, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import dayjs from 'dayjs';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { IPlatformSetting } from './platform-settings.reducer';
import { getPlatformSettings, updatePlatformSetting } from './platform-settings.reducer';

const formatUpdatedAt = (value?: string) => (value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '');

export const PlatformSettingsPage = () => {
  const dispatch = useAppDispatch();
  const { settings, loading, updatingKey, errorMessage } = useAppSelector(state => state.platformSettings);

  useEffect(() => {
    dispatch(getPlatformSettings());
  }, [dispatch]);

  const booleanFlags = settings.filter(setting => setting.type === 'BOOLEAN');
  const otherSettings = settings.filter(setting => setting.type !== 'BOOLEAN');

  const handleToggle = (setting: IPlatformSetting) => async () => {
    if (!setting.key) {
      return;
    }
    const nextValue = setting.value === 'true' ? 'false' : 'true';
    await dispatch(updatePlatformSetting({ key: setting.key, value: nextValue }));
  };

  const isUpdating = (key?: string) => Boolean(key && updatingKey === key);

  return (
    <div>
      <h2 id="platform-settings-page-heading" data-cy="platformSettingsPageHeading">
        <Translate contentKey="platformSettings.title">Platform settings</Translate>
      </h2>

      {errorMessage && (
        <Alert color="danger" data-cy="platformSettingsError">
          {errorMessage}
        </Alert>
      )}

      <Card className="mb-4">
        <CardBody>
          <CardTitle tag="h3" className="h5">
            <Translate contentKey="platformSettings.featureFlags.title">Feature flags</Translate>
          </CardTitle>
          {loading && booleanFlags.length === 0 ? (
            <Spinner size="sm" />
          ) : (
            booleanFlags.map(setting => (
              <FormGroup switch key={setting.key} className="mb-3">
                <Input
                  type="switch"
                  role="switch"
                  id={`flag-${setting.key}`}
                  checked={setting.value === 'true'}
                  disabled={isUpdating(setting.key)}
                  onChange={handleToggle(setting)}
                  data-cy={`platformSettingToggle-${setting.key}`}
                />
                <Label check for={`flag-${setting.key}`}>
                  <Translate contentKey={setting.labelKey ?? ''}>{setting.key}</Translate>
                </Label>
                {setting.descriptionKey && (
                  <div className="text-muted small ms-4">
                    <Translate contentKey={setting.descriptionKey} />
                  </div>
                )}
                {setting.updatedByLogin && setting.updatedAt && (
                  <div className="text-muted small ms-4">
                    <Translate
                      contentKey="platformSettings.updatedBy"
                      interpolate={{ user: setting.updatedByLogin, date: formatUpdatedAt(setting.updatedAt) }}
                    />
                  </div>
                )}
                {isUpdating(setting.key) && <Spinner size="sm" className="ms-2" />}
              </FormGroup>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CardTitle tag="h3" className="h5">
            <Translate contentKey="platformSettings.otherSettings.title">Other settings</Translate>
          </CardTitle>
          {otherSettings.length === 0 ? (
            <p className="text-muted mb-0">
              <Translate contentKey="platformSettings.otherSettings.empty">No additional settings registered yet.</Translate>
            </p>
          ) : (
            <Table responsive striped bordered size="sm">
              <thead>
                <tr>
                  <th>
                    <Translate contentKey="platformSettings.otherSettings.key">Key</Translate>
                  </th>
                  <th>
                    <Translate contentKey="platformSettings.otherSettings.value">Value</Translate>
                  </th>
                </tr>
              </thead>
              <tbody>
                {otherSettings.map(setting => (
                  <tr key={setting.key}>
                    <td>{setting.key}</td>
                    <td>{setting.value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default PlatformSettingsPage;
