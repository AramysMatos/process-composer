import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb as RsBreadcrumb, BreadcrumbItem } from 'reactstrap';

import './breadcrumb.scss';

export interface IBreadcrumbItem {
  label: string;
  path?: string;
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

        if (isLast) {
          return (
            <BreadcrumbItem key={key} active tag="li" aria-current="page">
              {item.label}
            </BreadcrumbItem>
          );
        }

        if (item.path) {
          return (
            <BreadcrumbItem key={key} tag="li">
              <Link to={item.path}>{item.label}</Link>
            </BreadcrumbItem>
          );
        }

        return (
          <BreadcrumbItem key={key} tag="li">
            {item.label}
          </BreadcrumbItem>
        );
      })}
    </RsBreadcrumb>
  );
};

export default Breadcrumb;
