SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: stock_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_snapshots (
    id bigint NOT NULL,
    ticker character varying NOT NULL,
    close double precision DEFAULT 0.0,
    volume double precision DEFAULT 0.0,
    open double precision DEFAULT 0.0,
    high double precision DEFAULT 0.0,
    low double precision DEFAULT 0.0,
    date date NOT NULL,
    sma20 double precision DEFAULT 0.0,
    sma50 double precision DEFAULT 0.0,
    sma200 double precision DEFAULT 0.0,
    rsi double precision DEFAULT 0.0
);


--
-- Name: stock_snapshots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_snapshots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_snapshots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_snapshots_id_seq OWNED BY public.stock_snapshots.id;


--
-- Name: symbol_maps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.symbol_maps (
    id bigint NOT NULL,
    ticker character varying NOT NULL,
    anonymous_ticker character varying NOT NULL
);


--
-- Name: symbol_maps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.symbol_maps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: symbol_maps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.symbol_maps_id_seq OWNED BY public.symbol_maps.id;


--
-- Name: stock_snapshots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_snapshots ALTER COLUMN id SET DEFAULT nextval('public.stock_snapshots_id_seq'::regclass);


--
-- Name: symbol_maps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.symbol_maps ALTER COLUMN id SET DEFAULT nextval('public.symbol_maps_id_seq'::regclass);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: stock_snapshots stock_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_snapshots
    ADD CONSTRAINT stock_snapshots_pkey PRIMARY KEY (id);


--
-- Name: symbol_maps symbol_maps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.symbol_maps
    ADD CONSTRAINT symbol_maps_pkey PRIMARY KEY (id);


--
-- Name: index_stock_snapshots_on_ticker_and_date; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_stock_snapshots_on_ticker_and_date ON public.stock_snapshots USING btree (ticker, date);


--
-- Name: index_symbol_maps_on_anonymous_ticker; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_symbol_maps_on_anonymous_ticker ON public.symbol_maps USING btree (anonymous_ticker);


--
-- Name: index_symbol_maps_on_ticker; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_symbol_maps_on_ticker ON public.symbol_maps USING btree (ticker);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('1'),
('2');


