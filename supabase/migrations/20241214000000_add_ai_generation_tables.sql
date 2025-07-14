-- AI Image Generation Tables Migration
-- Created: 2024-12-14
-- Purpose: Add tables to support AI image generation functionality

-- =====================================================
-- Table 1: ai_generations (AI图片生成记录)
-- =====================================================
create table public.ai_generations (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid references public.customers(id) on delete cascade not null,
    replicate_prediction_id text,
    generation_type text not null check (generation_type in ('text_to_image', 'image_to_image')),
    prompt text not null,
    input_image_url text,
    output_image_url text,
    output_format text not null check (output_format in ('jpg', 'png', 'webp')),
    aspect_ratio text not null check (aspect_ratio in ('1:1', '16:9', '21:9', '3:2', '4:3', '9:16', '2:3', 'match_input_image')),
    status text not null check (status in ('pending', 'processing', 'succeeded', 'failed')) default 'pending',
    error_message text,
    credits_used integer not null default 1 check (credits_used >= 0),
    generation_time_seconds integer check (generation_time_seconds >= 0),
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone
);

-- =====================================================
-- Table 2: user_uploads (用户上传图片记录)
-- =====================================================
create table public.user_uploads (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid references public.customers(id) on delete cascade not null,
    filename text not null,
    file_path text not null,
    file_url text not null,
    file_size bigint not null check (file_size > 0),
    mime_type text not null check (mime_type like 'image/%'),
    width integer check (width > 0),
    height integer check (height > 0),
    upload_source text not null check (upload_source in ('web_upload', 'api_upload')) default 'web_upload',
    is_deleted boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone
);

-- =====================================================
-- Table 3: usage_analytics (使用量统计)
-- =====================================================
create table public.usage_analytics (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid references public.customers(id) on delete cascade not null,
    date date not null,
    text_to_image_count integer not null default 0 check (text_to_image_count >= 0),
    image_to_image_count integer not null default 0 check (image_to_image_count >= 0),
    total_generations integer not null default 0 check (total_generations >= 0),
    credits_consumed integer not null default 0 check (credits_consumed >= 0),
    successful_generations integer not null default 0 check (successful_generations >= 0),
    failed_generations integer not null default 0 check (failed_generations >= 0),
    avg_generation_time decimal(8,2) check (avg_generation_time >= 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint usage_analytics_totals_match check (total_generations = text_to_image_count + image_to_image_count),
    constraint usage_analytics_status_match check (total_generations = successful_generations + failed_generations),
    unique(customer_id, date)
);

-- =====================================================
-- Table 4: generation_templates (生成模板)
-- =====================================================
create table public.generation_templates (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid references public.customers(id) on delete cascade not null,
    name text not null,
    description text,
    prompt_template text not null,
    output_format text not null check (output_format in ('jpg', 'png', 'webp')) default 'jpg',
    aspect_ratio text not null check (aspect_ratio in ('1:1', '16:9', '21:9', '3:2', '4:3', '9:16', '2:3', 'match_input_image')) default '1:1',
    is_public boolean not null default false,
    usage_count integer not null default 0 check (usage_count >= 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- 创建索引 (Performance Optimization)
-- =====================================================

-- ai_generations 表索引
create index ai_generations_customer_id_idx on public.ai_generations(customer_id);
create index ai_generations_status_idx on public.ai_generations(status);
create index ai_generations_created_at_idx on public.ai_generations(created_at desc);
create index ai_generations_type_idx on public.ai_generations(generation_type);
create index ai_generations_replicate_id_idx on public.ai_generations(replicate_prediction_id);

-- user_uploads 表索引
create index user_uploads_customer_id_idx on public.user_uploads(customer_id);
create index user_uploads_created_at_idx on public.user_uploads(created_at desc);
create index user_uploads_is_deleted_idx on public.user_uploads(is_deleted);
create index user_uploads_mime_type_idx on public.user_uploads(mime_type);

-- usage_analytics 表索引
create index usage_analytics_customer_date_idx on public.usage_analytics(customer_id, date);
create index usage_analytics_date_idx on public.usage_analytics(date desc);

-- generation_templates 表索引
create index generation_templates_customer_id_idx on public.generation_templates(customer_id);
create index generation_templates_public_idx on public.generation_templates(is_public) where is_public = true;
create index generation_templates_usage_idx on public.generation_templates(usage_count desc);

-- =====================================================
-- 创建 updated_at 触发器
-- =====================================================

-- usage_analytics 表触发器
create trigger handle_usage_analytics_updated_at
    before update on public.usage_analytics
    for each row
    execute function public.handle_updated_at();

-- generation_templates 表触发器
create trigger handle_generation_templates_updated_at
    before update on public.generation_templates
    for each row
    execute function public.handle_updated_at();

-- =====================================================
-- 启用 RLS (Row Level Security)
-- =====================================================

alter table public.ai_generations enable row level security;
alter table public.user_uploads enable row level security;
alter table public.usage_analytics enable row level security;
alter table public.generation_templates enable row level security;

-- =====================================================
-- RLS 策略 - ai_generations 表
-- =====================================================

-- 用户可以查看自己的生成记录
create policy "Users can view their own generations"
    on public.ai_generations for select
    using (
        exists (
            select 1 from public.customers
            where customers.id = ai_generations.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 用户可以插入自己的生成记录
create policy "Users can insert their own generations"
    on public.ai_generations for insert
    with check (
        exists (
            select 1 from public.customers
            where customers.id = ai_generations.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 用户可以更新自己的生成记录
create policy "Users can update their own generations"
    on public.ai_generations for update
    using (
        exists (
            select 1 from public.customers
            where customers.id = ai_generations.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 服务角色可以管理所有生成记录
create policy "Service role can manage all generations"
    on public.ai_generations for all
    using (auth.role() = 'service_role');

-- =====================================================
-- RLS 策略 - user_uploads 表
-- =====================================================

-- 用户可以查看自己的上传文件
create policy "Users can view their own uploads"
    on public.user_uploads for select
    using (
        exists (
            select 1 from public.customers
            where customers.id = user_uploads.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 用户可以插入自己的上传文件
create policy "Users can insert their own uploads"
    on public.user_uploads for insert
    with check (
        exists (
            select 1 from public.customers
            where customers.id = user_uploads.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 用户可以更新自己的上传文件（主要用于软删除）
create policy "Users can update their own uploads"
    on public.user_uploads for update
    using (
        exists (
            select 1 from public.customers
            where customers.id = user_uploads.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 服务角色可以管理所有上传文件
create policy "Service role can manage all uploads"
    on public.user_uploads for all
    using (auth.role() = 'service_role');

-- =====================================================
-- RLS 策略 - usage_analytics 表
-- =====================================================

-- 用户可以查看自己的使用统计
create policy "Users can view their own analytics"
    on public.usage_analytics for select
    using (
        exists (
            select 1 from public.customers
            where customers.id = usage_analytics.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 服务角色可以管理所有使用统计
create policy "Service role can manage all analytics"
    on public.usage_analytics for all
    using (auth.role() = 'service_role');

-- =====================================================
-- RLS 策略 - generation_templates 表
-- =====================================================

-- 用户可以查看自己的模板和公开模板
create policy "Users can view their own and public templates"
    on public.generation_templates for select
    using (
        is_public = true or
        exists (
            select 1 from public.customers
            where customers.id = generation_templates.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 用户可以插入自己的模板
create policy "Users can insert their own templates"
    on public.generation_templates for insert
    with check (
        exists (
            select 1 from public.customers
            where customers.id = generation_templates.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 用户可以更新自己的模板
create policy "Users can update their own templates"
    on public.generation_templates for update
    using (
        exists (
            select 1 from public.customers
            where customers.id = generation_templates.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 用户可以删除自己的模板
create policy "Users can delete their own templates"
    on public.generation_templates for delete
    using (
        exists (
            select 1 from public.customers
            where customers.id = generation_templates.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 服务角色可以管理所有模板
create policy "Service role can manage all templates"
    on public.generation_templates for all
    using (auth.role() = 'service_role');

-- =====================================================
-- 授予权限给服务角色
-- =====================================================

grant all on public.ai_generations to service_role;
grant all on public.user_uploads to service_role;
grant all on public.usage_analytics to service_role;
grant all on public.generation_templates to service_role;

-- 授予权限给认证用户
grant select, insert, update on public.ai_generations to authenticated;
grant select, insert, update on public.user_uploads to authenticated;
grant select on public.usage_analytics to authenticated;
grant select, insert, update, delete on public.generation_templates to authenticated;

-- =====================================================
-- 创建有用的视图和函数
-- =====================================================

-- 创建用户生成统计视图
create or replace view public.user_generation_stats as
select
    c.user_id,
    c.id as customer_id,
    count(ag.id) as total_generations,
    count(case when ag.status = 'succeeded' then 1 end) as successful_generations,
    count(case when ag.status = 'failed' then 1 end) as failed_generations,
    count(case when ag.generation_type = 'text_to_image' then 1 end) as text_to_image_count,
    count(case when ag.generation_type = 'image_to_image' then 1 end) as image_to_image_count,
    sum(ag.credits_used) as total_credits_used,
    avg(ag.generation_time_seconds) as avg_generation_time,
    max(ag.created_at) as last_generation_at
from public.customers c
left join public.ai_generations ag on c.id = ag.customer_id
group by c.user_id, c.id;

-- 为视图创建RLS策略
alter view public.user_generation_stats enable row level security;

create policy "Users can view their own generation stats"
    on public.user_generation_stats for select
    using (user_id = auth.uid());

-- 授予权限
grant select on public.user_generation_stats to authenticated;
grant all on public.user_generation_stats to service_role;

-- =====================================================
-- 实用函数
-- =====================================================

-- 函数：更新使用统计
create or replace function public.update_usage_analytics(
    p_customer_id uuid,
    p_generation_type text,
    p_credits_used integer,
    p_generation_time_seconds integer default null,
    p_success boolean default true
)
returns void as $$
declare
    today_date date := current_date;
begin
    insert into public.usage_analytics (
        customer_id,
        date,
        text_to_image_count,
        image_to_image_count,
        total_generations,
        credits_consumed,
        successful_generations,
        failed_generations,
        avg_generation_time
    ) values (
        p_customer_id,
        today_date,
        case when p_generation_type = 'text_to_image' then 1 else 0 end,
        case when p_generation_type = 'image_to_image' then 1 else 0 end,
        1,
        p_credits_used,
        case when p_success then 1 else 0 end,
        case when p_success then 0 else 1 end,
        p_generation_time_seconds
    )
    on conflict (customer_id, date) do update set
        text_to_image_count = usage_analytics.text_to_image_count +
            case when p_generation_type = 'text_to_image' then 1 else 0 end,
        image_to_image_count = usage_analytics.image_to_image_count +
            case when p_generation_type = 'image_to_image' then 1 else 0 end,
        total_generations = usage_analytics.total_generations + 1,
        credits_consumed = usage_analytics.credits_consumed + p_credits_used,
        successful_generations = usage_analytics.successful_generations +
            case when p_success then 1 else 0 end,
        failed_generations = usage_analytics.failed_generations +
            case when p_success then 0 else 1 end,
        avg_generation_time = case
            when p_generation_time_seconds is not null then
                case
                    when usage_analytics.avg_generation_time is null then p_generation_time_seconds
                    else (usage_analytics.avg_generation_time * usage_analytics.total_generations + p_generation_time_seconds) / (usage_analytics.total_generations + 1)
                end
            else usage_analytics.avg_generation_time
        end,
        updated_at = timezone('utc'::text, now());
end;
$$ language plpgsql security definer;

-- 函数：软删除上传文件
create or replace function public.soft_delete_upload(upload_id uuid)
returns boolean as $$
declare
    upload_exists boolean;
begin
    -- 检查文件是否存在且属于当前用户
    select exists(
        select 1 from public.user_uploads u
        join public.customers c on u.customer_id = c.id
        where u.id = upload_id
        and c.user_id = auth.uid()
        and u.is_deleted = false
    ) into upload_exists;

    if not upload_exists then
        return false;
    end if;

    -- 执行软删除
    update public.user_uploads
    set is_deleted = true, deleted_at = timezone('utc'::text, now())
    where id = upload_id;

    return true;
end;
$$ language plpgsql security definer;

-- =====================================================
-- 注释和文档
-- =====================================================

comment on table public.ai_generations is 'AI图片生成记录表，存储每次生成的完整信息';
comment on table public.user_uploads is '用户上传图片记录表，管理用户上传的文件';
comment on table public.usage_analytics is '使用量统计表，按日期聚合用户使用数据';
comment on table public.generation_templates is '生成模板表，保存用户常用的参数组合';

comment on column public.ai_generations.replicate_prediction_id is 'Replicate API返回的预测ID';
comment on column public.ai_generations.generation_type is '生成类型：text_to_image 或 image_to_image';
comment on column public.ai_generations.credits_used is '本次生成消耗的积分数';
comment on column public.user_uploads.is_deleted is '软删除标记，true表示已删除';
comment on column public.usage_analytics.avg_generation_time is '平均生成时间（秒）';
comment on column public.generation_templates.is_public is '是否公开分享给其他用户';

-- =====================================================
-- 迁移完成
-- =====================================================

-- 插入迁移记录（可选）
-- insert into public.migrations (name, executed_at) values ('20241214000000_add_ai_generation_tables', now());
