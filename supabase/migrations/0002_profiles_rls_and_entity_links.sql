create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, locale)
  values (new.id, coalesce(new.email, ''), 'ru')
  on conflict (id) do nothing;

  insert into public.settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table goals add column if not exists inbox_item_id uuid references inbox_items(id);
alter table habits add column if not exists inbox_item_id uuid references inbox_items(id);
alter table memories add column if not exists inbox_item_id uuid references inbox_items(id);
alter table events add column if not exists inbox_item_id uuid references inbox_items(id);

create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "settings_all_own" on settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "onboarding_answers_all_own" on onboarding_answers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "inbox_items_all_own" on inbox_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_all_own" on tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_all_own" on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habits_all_own" on habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "life_areas_all_own" on life_areas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "balance_scores_all_own" on balance_scores for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "suggestions_all_own" on suggestions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "memories_all_own" on memories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "events_all_own" on events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_plans_all_own" on daily_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications_all_own" on notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "audit_logs_select_own" on audit_logs for select using (auth.uid() = user_id);
