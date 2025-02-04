-- create or replace function private.handle_storage_delete()
-- returns trigger
-- language plpgsql
-- as $$
-- begin
--   delete from documents
--   where storage_object_id = OLD.id;
--   return OLD;
-- end;
-- $$;

-- create trigger on_file_delete
-- after delete on storage.objects
-- for each row
-- execute procedure private.handle_storage_delete();

create or replace function private.handle_document_delete()
returns trigger
language plpgsql
as $$
begin
  delete from storage.objects
  where id = OLD.storage_object_id;
  return OLD;
end;
$$;

create trigger on_document_delete
after delete on documents
for each row
execute procedure private.handle_document_delete();