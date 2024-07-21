import { useEffect, useState } from "react";
import { z, ZodError } from 'zod';
import { useSearchParams } from "react-router-dom";

export const useCleanSearchParams = <T extends z.ZodTypeAny>(schema: T) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cleanSearchParams, setCleanSearchParams] = useState<null | z.infer<T>>(null);
  const [searchError, setSearchError] = useState<ZodError | Error | null>(null);

  useEffect(() => {
    try {
      const cleanedParams = schema.parse(
        Object.fromEntries(searchParams)
      ) as z.infer<T>;
      setCleanSearchParams(cleanedParams);
      setSearchError(null);
    } catch (e) {
      setCleanSearchParams(null);
      if( e instanceof ZodError ) setSearchError(e);
      else setSearchError(new Error("Unable to clean search params - unknown error"));
    }
  }, [searchParams])

  return [{
    searchParams: cleanSearchParams,
    searchError,
    rawSearchParams: searchParams,
  }, setSearchParams] as [{
    searchParams: null,
    searchError: null,
    rawSearchParams: URLSearchParams
  } | {
    searchParams: z.infer<T>,
    searchError: null,
    rawSearchParams: URLSearchParams
  } | {
    searchParams: null,
    searchError: ZodError | Error,
    rawSearchParams: URLSearchParams
  }, typeof setSearchParams];
}