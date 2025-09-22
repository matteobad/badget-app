-- Custom SQL migration file, put your code below! --
-- funzione che azzera solo category_slug
CREATE OR REPLACE FUNCTION public.unset_transaction_category()
RETURNS trigger AS $$
BEGIN
  UPDATE public.badget_transaction_table
  SET category_slug = NULL
  WHERE organization_id = old.organization_id
    AND category_slug = old.slug;
  RETURN old;
END;
$$ LANGUAGE plpgsql;

-- trigger che richiama la funzione prima di cancellare una categoria
CREATE TRIGGER before_delete_category
BEFORE DELETE ON public.badget_transaction_category_table
FOR each ROW
EXECUTE FUNCTION public.unset_transaction_category();