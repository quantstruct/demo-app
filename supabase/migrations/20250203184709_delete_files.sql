create or replace function private.handle_storage_delete()
returns trigger
language plpgsql
as $$
begin
  delete from documents
  where storage_object_id = OLD.id;
  return OLD;
end;
$$;
create trigger on_file_delete
after delete on storage.objects
for each row
execute procedure private.handle_storage_delete();