import React from "react";
import { Link } from "react-router-dom";
import { poiUi } from "../ui";

export type SkeletonPoint = {
  title: string;
  description: string;
};

export function SkeletonCard(props: {
  title: string;
  description: string;
  points?: SkeletonPoint[];
}) {
  return (
    <section className={poiUi.card}>
      <h2 className={poiUi.cardTitle}>{props.title}</h2>
      <p className={poiUi.cardDesc}>{props.description}</p>

      {props.points && props.points.length > 0 ? (
        <div className={poiUi.list}>
          {props.points.map((point) => (
            <div key={point.title} className={poiUi.listItem}>
              <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
              <div>
                <div className="font-medium text-slate-900">{point.title}</div>
                <div className="mt-0.5 text-slate-600">{point.description}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function RouteEntryCard(props: {
  title: string;
  description: string;
  primaryTo: string;
  primaryText: string;
  secondaryTo?: string;
  secondaryText?: string;
}) {
  return (
    <section className={poiUi.card}>
      <h2 className={poiUi.cardTitle}>{props.title}</h2>
      <p className={poiUi.cardDesc}>{props.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={props.primaryTo} className={poiUi.primaryLink}>
          {props.primaryText}
        </Link>
        {props.secondaryTo && props.secondaryText ? (
          <Link to={props.secondaryTo} className={poiUi.secondaryLink}>
            {props.secondaryText}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
