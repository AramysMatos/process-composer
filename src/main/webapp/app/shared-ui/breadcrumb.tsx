import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb as RsBreadcrumb, BreadcrumbItem } from 'reactstrap';

import './breadcrumb.scss';

export interface IBreadcrumbItem {
  label: string;
  path?: string;
  suffix?: React.ReactNode;
}

export interface IBreadcrumbProps {
  items: IBreadcrumbItem[];
  className?: string;
  'data-cy'?: string;
}

export const Breadcrumb = ({ items, className, 'data-cy': dataCy }: IBreadcrumbProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <RsBreadcrumb
      className={`jh-breadcrumb ${className ?? ''}`.trim()}
      data-cy={dataCy}
      listClassName="breadcrumb"
      tag="nav"
      aria-label="breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const key = `${item.label}-${index}`;

        const suffix = item.suffix ? <span className="jh-breadcrumb__suffix">{item.suffix}</span> : null;

        if (isLast) {
          return (
            <BreadcrumbItem key={key} active tag="li" className="jh-breadcrumb__item" aria-current="page">
              <span className="jh-breadcrumb__item-inner">
                <span className="jh-breadcrumb__label">{item.label}</span>
                {suffix}
              </span>
            </BreadcrumbItem>
          );
        }

        if (item.path) {
          return (
            <BreadcrumbItem key={key} tag="li" className="jh-breadcrumb__item">
              <span className="jh-breadcrumb__item-inner">
                <Link to={item.path} className="jh-breadcrumb__label">
                  {item.label}
                </Link>
                {suffix}
              </span>
            </BreadcrumbItem>
          );
        }

        return (
          <BreadcrumbItem key={key} tag="li" className="jh-breadcrumb__item">
            <span className="jh-breadcrumb__item-inner">
              <span className="jh-breadcrumb__label">{item.label}</span>
              {suffix}
            </span>
          </BreadcrumbItem>
        );
      })}
    </RsBreadcrumb>
  );
};

export default Breadcrumb;
